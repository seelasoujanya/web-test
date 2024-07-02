#!/usr/bin/env sh

set -x
set -e

if [ -n "$1" ]
  then
    STAGE="$1"
  else
    echo "STAGE must be specified" && exit 1
fi

#Application Info
APP_NAME="deliver"
PROJECT_COMMON_NAME="bmg-supplychain"
GCP_REGISTRY="europe-west1-docker.pkg.dev"
GCP_PROJECT="${PROJECT_COMMON_NAME}-${STAGE}"
IMAGE="${GCP_REGISTRY}/${GCP_PROJECT}/${APP_NAME}/frontend"
  
if [ $STAGE = "test" ]
  then
    PROXY="10.14.232.48"
elif [ $STAGE = "staging" ]
  then
    PROXY="squid.k8s.bmg-monitoring-prod.gcp.internal.bmg.com"
    #STAGE="stage"
  else
    PROXY="10.14.232.183"
fi

#Proxy exports
export http_proxy="http://${PROXY}:3128"
export https_proxy="http://${PROXY}:3128"
export no_proxy="https://nexus.bmg.com"

echo """
{
  \"auths\": {},
	\"credHelpers\": {
		\"asia.gcr.io\": \"gcr\",
		\"eu.gcr.io\": \"gcr\",
		\"gcr.io\": \"gcr\",
		\"marketplace.gcr.io\": \"gcr\",
		\"us.gcr.io\": \"gcr\",
    \"europe-west1-docker.pkg.dev\": \"gcr\"
	},
  \"proxies\": {
    \"default\": {
      \"httpProxy\": \"http://${PROXY}:3128\",
      \"httpsProxy\": \"http://${PROXY}:3128\",
      \"noProxy\": \"https://nexus.bmg.com\"
    }
  }
} """ > config.json
mkdir -p ~/.docker
sudo cp config.json ~/.docker/
rm config.json

echo """
[Service]
Environment="HTTP_PROXY=http://${PROXY}:3128"
Environment="HTTPS_PROXY=http://${PROXY}:3128"
Environment="NO_PROXY=localhost,https://nexus.bmg.com,*.bmg.com,*gcr.io"
""" > proxy.conf
sudo mv proxy.conf /etc/systemd/system/docker.service.d/

sudo systemctl daemon-reload
sleep 5
sudo systemctl restart docker
sleep 5

#Build docker image
echo "Build docker image for ${STAGE}"
sudo docker build -t ${IMAGE}:${BUILD_NUMBER} --build-arg ENV=${STAGE} -f Dockerfile_Jenkins .

#Docker configure
echo "Docker configure"
wget "https://github.com/GoogleCloudPlatform/docker-credential-gcr/releases/download/v2.0.0/docker-credential-gcr_linux_amd64-2.0.0.tar.gz"
tar -xzvf docker-credential-gcr_linux_amd64-2.0.0.tar.gz
sudo cp docker-credential-gcr /usr/local/bin/docker-credential-gcr
sudo chmod +x /usr/local/bin/docker-credential-gcr;
unset http_proxy https_proxy
docker-credential-gcr configure-docker

#Docker image Push
echo "Docker image Push"
docker push ${IMAGE}:${BUILD_NUMBER}