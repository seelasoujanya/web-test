#!/usr/bin/env sh
set -x
set -e

if [ -n "$1" ]
  then
    STAGE="$1"
  else
    echo "STAGE must be specified" && exit 1
fi
token="$2"
PROXY_PORT="3128"
SONARQUBE_URL_DOMAIN="http://sonarqube-jenkins-test.bmg.com"
SONAR_PROJECT_NAME="bmg-supplychain-deliver_upgrade-frontend"
SONAR_PROJECT_KEY="bmg-supplychain-deliver_upgrade-frontend-$STAGE"

if [ $STAGE = "test" ]
  then
    PROXY="10.14.232.48"
elif [ $STAGE = "staging" ]
  then
    PROXY="squid.k8s.bmg-monitoring-prod.gcp.internal.bmg.com"
    STAGE="stage"
  else
    PROXY="10.14.232.183"
fi
export http_proxy="http://${PROXY}:3128"
export https_proxy="http://${PROXY}:3128"
export no_proxy="localhost,https://nexus.bmg.com,*.gcr.io,gcr.io,metadata.google.internal,registry-1.docker.io"

echo -n "systemProp.https.proxyHost=${PROXY}
systemProp.https.proxyPort=3128
systemProp.http.proxyHost=${PROXY}
systemProp.http.proxyPort=3128
systemProp.https.nonProxyHosts=localhost,https://nexus.bmg.com,*.bmg.com,*.gcr.io" >> gradle.properties

echo """
[Service]
Environment="HTTP_PROXY=${http_proxy}"
Environment="HTTPS_PROXY=${https_proxy}"
Environment="NO_PROXY=localhost,https://nexus.bmg.com,*.bmg.com,*.gcr.io,gcr.io"
""" > proxy.conf
sudo mv proxy.conf /etc/systemd/system/docker.service.d/
cat /etc/systemd/system/docker.service.d/proxy.conf

echo """
sonar.projectName=${SONAR_PROJECT_NAME}
sonar.projectKey=${SONAR_PROJECT_KEY}
sonar.host.url=${SONARQUBE_URL_DOMAIN}
sonar.login=$2
sonar.projectVersion=1.0
sonar.sourceEncoding=UTF-8
sonar.sources=src
sonar.exclusions=**/node_modules/**
sonar.tests=src
sonar.test.inclusions=**/*.spec.ts
sonar.typescript.lcov.reportPaths=coverage/deliver-upgrade-frontend/lcov.info
""" > sonar-project.properties

wget https://nodejs.org/dist/v18.17.0/node-v18.17.0-linux-x64.tar.xz
tar -xvf node-v18.17.0-linux-x64.tar.xz
sudo rm -rf /opt/node-v18.17.0-linux-x64
sudo mv node-v18.17.0-linux-x64 /opt/
export PATH=$PATH:/opt/node-v18.17.0-linux-x64/bin
npm install --legacy-peer-deps
npm run test:report
npm run sonar