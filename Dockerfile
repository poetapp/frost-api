FROM node:10.12.0

RUN apt-get update && apt-get install -y \
    rsync

WORKDIR /usr/src/app/api

RUN npm install node-gyp -g

COPY entrypoint.sh /entrypoint.sh
COPY package.json ./package.json
COPY api_dist ./dist
COPY api_node_modules ./node_modules

ENTRYPOINT ["/entrypoint.sh"]
CMD [ "api" ]
