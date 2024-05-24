#!/usr/bin/env sh

set -x
set -e

GitAppRepo="bitbucket.org/bmgpipeline/deliver-mt-gke.git"
GitAppRepoName="deliver-mt-gke"
GitAppBranch="main"
guser="$2"
gpass="$3"
duser="$4"

if [ -n "$1" ]
  then
    STAGE="$1"
  else
    echo "STAGE must be specified" && exit 1
fi

if [ ${STAGE} = "staging" ]
  then
    STAGE="stage"
fi


TAG="${BUILD_ID}"
rm -rf $GitAppRepoName || true

#Clone MT repository
git clone https://${guser}:${gpass}@${GitAppRepo}
cd ${GitAppRepoName}

#Format triggered user info
email=$(echo "$duser" | sed 's/^.//;s/.$//')
name="${email%%@*}"

#Git config user
git config --global user.email $email
git config --global user.name  $name

#Update frontent version/tag
echo -n ${TAG} >overlays/${STAGE}/versions/frontend.version

#Git update
git add overlays/${STAGE}/versions/frontend.version
git commit -m "${STAGE} Deliver-frontend-sync request deployed with tag ${TAG}, from deploy pipeline"
git push origin $GitAppBranch
