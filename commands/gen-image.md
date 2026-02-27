---
allowed-tools:
  - "mcp__open-animate__gen_image"
  - Bash
  - Write
---

# /gen-image — Generate an image

Generate an image using the open-animate MCP server.

## Instructions

1. Parse the prompt from `$ARGUMENTS`.
2. Call the `gen_image` MCP tool with the prompt.
3. Report the generated URL to the user.
4. If the current directory has a `public/` folder, offer to download the image there using `curl -o public/<filename> "<url>"`.
