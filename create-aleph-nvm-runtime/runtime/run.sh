#!/bin/sh

NVM=/root/.nvm/nvm.sh
NVMRC=/opt/code/.nvmrc
VERSION=--lts

if [[ -f "$NVM" ]]; then
  . $NVM
fi

if [[ -f "$NVMRC" ]]; then
  VERSION="$(cat $NVMRC)"
fi

echo $VERSION

nvm install $VERSION
nvm use $VERSION

if [[ $1 == *.js ]]; then
  node $1 &
else
  exec $1 &
fi