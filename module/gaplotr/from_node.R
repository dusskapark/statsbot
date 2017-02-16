# javascript로부터 넘어오는 request를 받게 되는 R 스크립트
# 
# - 스크립트가 먼저 실행된 뒤에
# - getChart() 함수가 호출되며 인수가 JSON 타잎으로 넘어온다

v('plotr.R activated')

# 차트 그림파일을 생성해서 리턴하는 함수
generateChart <- function(json) {
  v('generateChart() start: json = %s', json)
  
  args <- fromJSON(json, simplifyVector = FALSE)

#  print(args)
#  print(args$ga_params)
#  print(args$chart_params)
  
  filename <- gaplotr$generateChart(
    ga_params = args$ga_params,
    chart_params = args$chart_params,
    query_params = args$query_params
  )

  v('filename = %s', filename)
  
  return(filename)
}