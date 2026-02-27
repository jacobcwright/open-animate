# Open Animate — MCP Tools Reference

MCP server URL: `https://api.oanim.dev/mcp`

## Authentication

All requests require an API key via the `Authorization` header:
```
Authorization: Bearer <ANIMATE_API_KEY>
```

Get an API key at [oanim.dev/dashboard/api-keys](https://oanim.dev/dashboard/api-keys).

## Tools

### `gen_image`

Generate an image from a text prompt.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | yes | — | Text description of the image |
| `model` | string | no | `fal-ai/flux/schnell` | fal.ai model ID |
| `image_size` | string | no | `landscape_16_9` | Image size preset |
| `num_images` | number | no | `1` | Number of images |

**Returns:** `{ url, model, estimatedCostUsd }`

---

### `edit_image`

Edit an existing image with a text prompt.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `image_url` | string | yes | — | URL of the source image |
| `prompt` | string | yes | — | Text description of edits |
| `model` | string | no | `fal-ai/flux/dev/image-to-image` | fal.ai model ID |

**Returns:** `{ url, model, estimatedCostUsd }`

---

### `remove_bg`

Remove the background from an image.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `image_url` | string | yes | — | URL of the image |
| `model` | string | no | `fal-ai/birefnet` | fal.ai model ID |

**Returns:** `{ url, model, estimatedCostUsd }`

---

### `upscale`

Upscale an image to higher resolution.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `image_url` | string | yes | — | URL of the image |
| `scale` | number | no | `2` | Scale factor |
| `model` | string | no | `fal-ai/creative-upscaler` | fal.ai model ID |

**Returns:** `{ url, model, estimatedCostUsd }`

---

### `gen_video`

Generate a video from a text prompt. Long-running — polls until complete.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | yes | — | Text description of the video |
| `model` | string | no | `fal-ai/kling-video/v1/standard/text-to-video` | fal.ai model ID |
| `duration` | string | no | `"5"` | Video duration in seconds |

**Returns:** `{ url, model, estimatedCostUsd }`

---

### `gen_audio`

Generate audio/music from a text prompt. Long-running — polls until complete.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | yes | — | Text description of the audio |
| `model` | string | no | `fal-ai/stable-audio` | fal.ai model ID |
| `duration_in_seconds` | number | no | `30` | Audio duration in seconds |

**Returns:** `{ url, model, estimatedCostUsd }`

---

### `run_model`

Run any fal.ai model with custom input.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `model` | string | yes | — | fal.ai model ID |
| `input` | object | yes | — | Model input parameters |
| `async` | boolean | no | `false` | Use queue-based polling for long-running models |

**Returns:** `{ url, result, model, estimatedCostUsd }`
