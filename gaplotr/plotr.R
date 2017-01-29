# javascript로부터 넘어오는 request를 받게 되는 R 스크립트
# 
# - 스크립트가 먼저 실행된 뒤에
# - getChart() 함수가 호출되며 인수가 JSON 타잎으로 넘어온다

v('plotr.R activated')

setwd('/home/ubuntu/workspace/gaplotr')

getChart <- function(json) {
  v('generateChart() start: json = %s', json)
  
  args <- fromJSON(json)

  filename <- gaplotr$generateChart(args$site_id,
    args$type,
    args$params,
    args$title,
    args$filename)

  v('filename = %s', filename)
  
  return(filename)
}