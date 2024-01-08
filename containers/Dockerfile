FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

ARG CAROOT_PATH
ENV CAROOT ${CAROOT_PATH}
#WORKDIR /workspaces/vulneratter
RUN ls
RUN <<EOF
    
    curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
    chmod +x mkcert-v*-linux-amd64
    sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert
    rm mkcert-v*-linux-amd64
EOF