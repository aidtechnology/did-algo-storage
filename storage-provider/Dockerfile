FROM node:lts-alpine

ADD . /home/node/app

WORKDIR /home/node/app

RUN \
  npm install

EXPOSE 3000

ENTRYPOINT [ "/home/node/app/run.sh" ]

