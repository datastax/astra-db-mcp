#!/bin/bash
# @author Madhavan Sridharan
set -euo pipefail

which docker > /dev/null || (echoerr "Please ensure that docker is installed" && exit 1)

cd -P -- "$(dirname -- "$0")" # switch to this dir

CHANGELOG_FILE=CHANGELOG.md
previous_version_line_number=$(awk '/## \[v/ {print NR; exit}' "$CHANGELOG_FILE")
previous_version=$(head -$previous_version_line_number $CHANGELOG_FILE | grep "## \[v" | awk -F']' '{print $1}' | cut -c 5-)
echo "previous_version:" $previous_version
# Remove the header so we can append the additions
tail -n +$previous_version_line_number "$CHANGELOG_FILE" > "$CHANGELOG_FILE.tmp" && mv "$CHANGELOG_FILE.tmp" "$CHANGELOG_FILE"

if [[ -z ${GITHUB_TOKEN-} ]]; then
  echo "**WARNING** GITHUB_TOKEN is not currently set" >&2
  exit 1
fi

INTERACTIVE=""
if [[ -t 1 ]]; then
  INTERACTIVE="-it"
fi

docker run $INTERACTIVE --rm -v "$(pwd)":/usr/local/src/your-app githubchangeloggenerator/github-changelog-generator -u datastax -p astra-db-mcp -t $GITHUB_TOKEN --since-tag $previous_version --base $CHANGELOG_FILE --output $CHANGELOG_FILE --release-branch 'main' --exclude-labels 'duplicate,question,invalid,wontfix'

# Remove the additional footer added
head -n $(( $(wc -l < $CHANGELOG_FILE) - 3 )) $CHANGELOG_FILE > "$CHANGELOG_FILE.tmp" && mv "$CHANGELOG_FILE.tmp" "$CHANGELOG_FILE"