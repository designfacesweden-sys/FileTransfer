#!/usr/bin/env bash
# Open Google Cloud API pages required for SvelteKit SSR on Firebase Hosting.
# Run each link, click Enable, wait 2–5 minutes, then: npm run deploy:firebase

PROJECT=keira-581e4

URLS=(
  "https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=${PROJECT}"
  "https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=${PROJECT}"
  "https://console.cloud.google.com/apis/library/run.googleapis.com?project=${PROJECT}"
  "https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=${PROJECT}"
  "https://console.cloud.google.com/apis/library/cloudresourcemanager.googleapis.com?project=${PROJECT}"
  "https://console.firebase.google.com/project/${PROJECT}/usage/details"
)

echo "Enable these APIs for project: ${PROJECT}"
echo ""
for url in "${URLS[@]}"; do
  echo "  ${url}"
done
echo ""
echo "Also ensure billing is on Blaze plan (required for SSR / Cloud Functions)."
echo "After enabling, wait a few minutes, then run: npm run deploy:firebase"
echo ""

if command -v open >/dev/null 2>&1; then
  read -r -p "Open all links in browser now? [y/N] " ans
  if [[ "${ans}" =~ ^[Yy]$ ]]; then
    for url in "${URLS[@]}"; do
      open "${url}"
      sleep 0.5
    done
  fi
fi
