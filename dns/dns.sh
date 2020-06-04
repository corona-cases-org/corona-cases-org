#!/bin/bash

# Run with --dry-run to see what changes will be made.

cli53 import "$@" --replace --file zonefile.txt corona-cases.org
