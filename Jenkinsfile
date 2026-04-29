pipeline {
    agent any

    options {
        timestamps()
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '15'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        APP_NAME      = 'crisiview-api'
        IMAGE_TAG     = "${env.BUILD_NUMBER}"
        IMAGE_FULL    = "${APP_NAME}:${IMAGE_TAG}"
        IMAGE_LATEST  = "${APP_NAME}:latest"
        DEPLOY_DIR    = '/opt/crisiview/api'
        SONAR_SERVER  = 'SonarQube'
        SONAR_SCANNER = 'SonarScanner'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                sh 'git rev-parse --short HEAD > .gitcommit'
                script { env.GIT_COMMIT_SHORT = readFile('.gitcommit').trim() }
                echo "Building commit ${env.GIT_COMMIT_SHORT} as build #${env.BUILD_NUMBER}"
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'docker stop sonarqube || true'
                sh 'node -v && npm -v'
                sh 'npm ci --no-audit --no-fund --prefer-offline'
            }
        }

        stage('Unit & integration tests') {
            steps {
                sh 'mkdir -p reports coverage'
                sh 'npm run test:ci'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/test-report.xml'
                    archiveArtifacts artifacts: 'coverage/lcov.info,reports/test-report.xml',
                                     allowEmptyArchive: true,
                                     fingerprint: true
                }
            }
        }

        stage('SAST - SonarQube analysis') {
            steps {
                sh 'docker start sonarqube || true'
                sh '''
                    for i in $(seq 1 90); do
                        if curl -fsS http://sonarqube:9000/api/system/status 2>/dev/null | grep -q "UP"; then
                            echo "Sonar ready after ${i} attempts"; exit 0
                        fi
                        sleep 2
                    done
                    echo "Sonar not ready in time"; exit 1
                '''
                script {
                    def scannerHome = tool name: env.SONAR_SCANNER, type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    withSonarQubeEnv(env.SONAR_SERVER) {
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectVersion=${env.BUILD_NUMBER}"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Dependency audit (DevSecOps)') {
            steps {
                sh 'npm run audit:ci'
                archiveArtifacts artifacts: 'reports/npm-audit.json',
                                 allowEmptyArchive: true,
                                 fingerprint: true
            }
        }

        stage('Build Docker image') {
            steps {
                sh """
                    docker build \
                        --pull \
                        --label org.opencontainers.image.revision=${env.GIT_COMMIT_SHORT} \
                        --label org.opencontainers.image.version=${env.BUILD_NUMBER} \
                        -t ${IMAGE_FULL} \
                        -t ${IMAGE_LATEST} \
                        .
                """
                sh "docker image ls ${APP_NAME}"
            }
        }

        stage('Package image') {
            steps {
                sh "docker save ${IMAGE_LATEST} | gzip > ${APP_NAME}.tar.gz"
                archiveArtifacts artifacts: "${APP_NAME}.tar.gz", fingerprint: true
            }
        }

        stage('Deploy to staging (VM-back)') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'ssh-back',
                                      keyFileVariable: 'SSH_KEY',
                                      usernameVariable: 'SSH_USER'),
                    string(credentialsId: 'vm-back-host',     variable: 'VM_HOST'),
                    string(credentialsId: 'mysql-root-pwd',   variable: 'MYSQL_ROOT_PASSWORD'),
                    string(credentialsId: 'mysql-app-pwd',    variable: 'MYSQL_APP_PASSWORD'),
                ]) {
                    sh '''
                        SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
                        ssh -i $SSH_KEY $SSH_OPTS $SSH_USER@$VM_HOST "mkdir -p ${DEPLOY_DIR}"

                        scp -i $SSH_KEY $SSH_OPTS \
                            ${APP_NAME}.tar.gz \
                            deploy/docker-compose.back.yml \
                            $SSH_USER@$VM_HOST:${DEPLOY_DIR}/

                        ssh -i $SSH_KEY $SSH_OPTS $SSH_USER@$VM_HOST "
                            set -e
                            cd ${DEPLOY_DIR}
                            gunzip -c ${APP_NAME}.tar.gz | docker load
                            cat > .env <<EOF
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_APP_PASSWORD=${MYSQL_APP_PASSWORD}
API_IMAGE=${IMAGE_LATEST}
EOF
                            docker compose -f docker-compose.back.yml --env-file .env up -d --remove-orphans
                            docker compose -f docker-compose.back.yml ps
                        "
                    '''
                }
            }
        }

        stage('Smoke test staging') {
            steps {
                withCredentials([string(credentialsId: 'vm-back-host', variable: 'VM_HOST')]) {
                    sh '''
                        for i in $(seq 1 30); do
                            if curl -fsS http://$VM_HOST:3001/incidents > /dev/null; then
                                echo "API healthy after ${i} attempt(s)"
                                exit 0
                            fi
                            echo "Waiting for API... ($i/30)"
                            sleep 2
                        done
                        echo "API did not come up in time"
                        exit 1
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f --filter label!=org.opencontainers.image.revision=${GIT_COMMIT_SHORT} || true'
        }
        success {
            echo "Pipeline OK - ${IMAGE_FULL} deployed."
        }
        failure {
            echo "Pipeline FAILED - check stage logs."
        }
    }
}
