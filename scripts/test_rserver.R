#!/usr/bin/env Rscript

library(RSclient)

c <- RSconnect()
RSeval(c, quote({
source(sprintf('%s/workspace/gaplotr/plotr.R'), Sys.getenv('HOME'))
}))

RSeval(c, quote({
getChart('{
  "site_id": "onestore_app",
  "type": "line",
  "params" : {
    "dimensions" : "ga:date",
    "metrics"    : [ "ga:users", "ga:newUsers" ],
    "start-date" : "7daysAgo",
    "end-date"   : "today"
  },
  "title" : "Chart",
  "filename" : "test_server.png"
}')
}))