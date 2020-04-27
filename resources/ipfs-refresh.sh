ipfs files rm -rf /content
ipfs files mkdir /content
ipfs files mkdir /content/resources
echo "" | ipfs files write --create /content/resources/aliases.json
