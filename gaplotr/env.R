# Rserve가 커넥션을 받기 전에 환경을 잡아주는 스크립트
#
# - start_server.R에 의해 구동됨.
# - 수정 뒤에는 서버 재기동 필요: ./stop_server.R; ./start_server.R 

library(httr)
library(rga)
library(jsonlite)
library(gaplotr)
library(stringr)

v <- function(...) {
  cat(base::date(), sprintf(...), '\n', file=stderr())
}

setwd('/home/ubuntu/workspace/gaplotr')

v('Start initialization of gaplotr')
gaplotr <- gaplotr::gaplotr('config.json')
v('End initialization of gaplotr')

