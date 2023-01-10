#!/bin/bash

urldecode() { : "${*//+/ }"; echo -e "${_//%/\\x}"; }

search_dir="$1"
i=0
inner=(list)
for folder in "$search_dir"/*;
  do
    name="$(urldecode "$(basename "$folder")")"
    type=()
    j=0
    for subfolder in "$folder"/*;
      do
        type["$j"]=$(basename "$subfolder")
        ((j++))
      done

    inner["$i"]=$(jq -n --arg id "ns$((i + 1))" \
                  --arg name "$name" \
                  --argjson type "$(jq -c -n '$ARGS.positional' --args "${type[@]}")" \
                  '$ARGS.named'
    )
    ((i++))
  done

final=$(jq -n --argjson Namespace "$(jq -c -n '$ARGS.positional' --jsonargs "${inner[@]}")" \
              '$ARGS.named'
)
echo "done"
echo "$final" > "$PWD/public/Namespace.json"