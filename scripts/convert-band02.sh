#!/usr/bin/env bash
# Run from project root: bash scripts/convert-band02.sh
# Replaces public/videos/band02.{mp4,webm,jpg} from referencia/05.mov
set -e

SRC="referencia/05.mov"
OUT_MP4="public/videos/band02.mp4"
OUT_WEBM="public/videos/band02.webm"
OUT_POSTER="public/videos/band02-poster.jpg"

echo "→ MP4 (ping-pong, 6s, 1280p)…"
ffmpeg -hide_banner -loglevel error -y -t 6 -i "$SRC" \
  -filter_complex "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,fps=30,scale=1280:-2" \
  -c:v libx264 -crf 28 -preset slow -an -pix_fmt yuv420p -movflags +faststart \
  "$OUT_MP4"

echo "→ WebM…"
ffmpeg -hide_banner -loglevel error -y -i "$OUT_MP4" \
  -c:v libvpx-vp9 -crf 42 -b:v 0 -an -row-mt 1 -threads 4 -deadline good \
  "$OUT_WEBM"

echo "→ Poster…"
ffmpeg -hide_banner -loglevel error -y -i "$OUT_MP4" \
  -vf "select=eq(n\,30),scale=1920:-2" -frames:v 1 -q:v 5 \
  "$OUT_POSTER"

ls -lh "$OUT_MP4" "$OUT_WEBM" "$OUT_POSTER"
echo "✓ band02 ready"
