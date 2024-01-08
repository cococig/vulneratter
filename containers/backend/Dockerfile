FROM node

ADD ./ /workspaces

WORKDIR /workspaces

RUN apt-get update && apt-get install -y sqlite3  && npm install && npm run migrate && npm run -w backend seed

CMD ["npm", "run", "-w", "backend", "start"]