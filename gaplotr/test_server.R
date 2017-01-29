#!/usr/bin/env Rscript

library(RSclient)

c <- RSconnect()
RSeval(c, quote({
source('/home/ubuntu/workspace/gaplotr/plotr.R')
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