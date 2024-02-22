FROM node:lts-alpine

WORKDIR /app

# Copy files
COPY ./src/ ./src
COPY ./resources/ ./resources
COPY ./package.json .
COPY ./entrypoint.sh .
RUN chmod +x entrypoint.sh

# Install dependencies
RUN npm install

ENTRYPOINT [ "./entrypoint.sh" ]