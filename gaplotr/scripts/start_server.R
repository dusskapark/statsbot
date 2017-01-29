#!/usr/bin/env Rscript

library(Rserve)

env_file_path <- sprintf('%s/workspace/gaplotr/env.R', Sys.getenv('HOME'))

args <- sprintf('--RS-source %s', env_file_path)
Rserve(args=args)
