# Rserve가 커넥션을 받기 전에 환경을 잡아주는 스크립트
#
# - start_server.R에 의해 구동됨.
# - 수정 뒤에는 서버 재기동 필요: ./stop_server.R; ./start_server.R 

library(gaplotr)
library(jsonlite)

v <- function(...) {
  cat(base::date(), sprintf(...), '\n', file=stderr())
}

setwd(sprintf('%s/workspace', Sys.getenv('HOME')))

v('Start initialization of gaplotr')
gaplotr <- gaplotr::gaplotr('config/gaplotr.json')
v('End initialization of gaplotr')

