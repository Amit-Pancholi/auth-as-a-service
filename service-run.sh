#! /bin/bash
set -e
project_path="$(pwd)"
# check for mode 
if ! command -v node &>/dev/null; then
    echo "[ERROR] node not found in system."
    exit 1
fi

read -r -p "Enter psql database url : " database_url
if [[ -z "$database_url" ]];then 
    echo "[ERROR] Database url is not found."
    exit 1
fi

if [[ ! -f ./client-service/.env ]];then
    cat > ./client-service/.env << EOF
PORT=8000
DATABASE_URL=$database_url
JWT_CLIENT_SECRET=replace-with-a-long-client-secret
JWT_URL_SECRET=replace-with-a-long-url-secret
USER_SERVICE_URL=http://localhost:8001/api/AaaS/user/v1
TOKEN_SERVICE_URL=http://localhost:8002/api/AaaS/token/v1
RBAC_SERVICE_URL=http://localhost:8003/api/AaaS/rbac/v1
USER_ACCESS=http://localhost:8001/api/AaaS/user/v1
EOF
fi

if [[ ! -f ./frontend/.env ]];then    
    cat > ./frontend/.env << EOF
PORT=3000
BACKEND_URL=http://localhost:8000
SESSION_SECRET=replace-with-a-long-random-session-secret
EOF
fi

if [[ ! -f ./rbac-service/.env ]];then
    cat > ./rbac-service/.env << EOF
PORT=8003
DATABASE_URL=$database_url
JWT_CLIENT_SECRET=replace-with-the-same-client-secret
USER_SERVICE_URL=http://localhost:8001/api/AaaS/user/v1
TOKEN_SERVICE_URL=http://localhost:8002/api/AaaS/token/v1
EOF
fi

if [[ ! -f ./token-service/.env ]];then
    cat > ./token-service/.env << EOF
DATABASE_URL=$database_url
JWT_CLIENT_SECRET=replace-with-the-same-client-secret
USER_SERVICE_URL=http://localhost:8001/api/AaaS/user/v1
RBAC_SERVICE_URL=http://localhost:8003/api/AaaS/rbac/v1
EOF
fi

if [[ ! -f ./user-service/.env ]]; then
    cat > ./user-service/.env << EOF
PORT=8001
DATABASE_URL=$database_url
JWT_CLIENT_SECRET=replace-with-the-same-client-secret
JWT_URL_SECRET=replace-with-the-same-url-secret
TOKEN_SERVICE_URL=http://localhost:8002/api/AaaS/token/v1
RBAC_SERVICE_URL=http://localhost:8003/api/AaaS/rbac/v1
EOF
fi

function setup_nginx(){
    if ! command -v nginx &>/dev/null; then
        echo "[ERROR] nginx is not found"
        exit 1
    fi
    
    sudo cp ./nginx/nginx.local.conf /etc/nginx/nginx.conf 
    sudo nginx -t && sudo nginx -s reload || exit 1
}

function install_requrment(){
    cd "$project_path/client-service" && npm install && npx prisma migrate dev 
    cd "$project_path/rbac-service" && npm install && npx prisma migrate dev 
    cd "$project_path/token-service" && npm install && npx prisma migrate dev 
    cd "$project_path/user-service" && npm install && npx prisma migrate dev
    cd "$project_path/frontend" && npm install
}

function run_server(){
    cd "$project_path/client-service" && npm start &
    cd "$project_path/rbac-service" && npm start &
    cd "$project_path/token-service" && npm start &
    cd "$project_path/user-service" && npm start &
    cd "$project_path/frontend" && npm start &
}


function main(){
    setup_nginx 
    install_requrment 
    run_server 
}
main 
