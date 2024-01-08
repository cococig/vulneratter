FROM node

ADD ./ /workspaces

WORKDIR /workspaces

RUN npm install

CMD ["npm", "run", "-w", "frontend", "start"]