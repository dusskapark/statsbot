#!/usr/bin/env Rscript

# gaplotr 패키지 업데이트 버전이 github에 올라왔을 때 이를 쉽게 반영하기 위한 스크립트.
# root 권한이 필요하므로 sudo와 함께 실행해 주어야 함 

library(devtools)
options(download.file.method = "wget")
install_github('hkjinlee/gaplotr')
