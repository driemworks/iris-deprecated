##################
# This script does a few things.
# 1) clears the /content directory, required for using iris
# 2) created the any and all default directories required by iris (in IPFS)
##################

ipfs files rm -rf /content
ipfs files mkdir /content
ipfs files mkdir /content/resources
echo "" | ipfs files write --create /content/resources/aliases.json
