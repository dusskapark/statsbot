#!/usr/bin/env Rscript

library(Rserve)

APPROOT <- sprintf('%s/workspace', Sys.getenv('HOME'))
WORKDIR <- sprintf('%s/cache/Rserve', APPROOT);
ENVFILE <- sprintf('%s/module/gaplotr/env.R', APPROOT);

args <- sprintf('--RS-workdir %s --RS-source %s', WORKDIR, ENVFILE)
Rserve(args=args)
