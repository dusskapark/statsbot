#!/usr/bin/env Rscript

# 서버 종료
require('RSclient')
c <- RSconnect()
RSshutdown(c)

# 임시파일 삭제
system('find $HOME/workspace/cache/Rserve -type d -name "conn*" | xargs rm -rf')
