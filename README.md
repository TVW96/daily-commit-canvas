# Commit Canvas

Commit Canvas is a daily visual archive generated from GitHub repository
activity, project design signals, and current design research.

Every repository with qualifying activity receives:

- a vector-friendly transparent PNG logo mark;
- a more expressive JPG editorial scene;
- dated archive metadata, palette information, and download links.

When no new commits are available, the daily cycle revisits the latest
non-gallery project using new evidence from human–AI interaction research,
UI/UX findings, accessibility guidance, design standards, and topic-specific
news. It then creates a meaningfully different iteration rather than duplicating
the previous images.

The archive runs at **4:45 AM Pacific time** and treats **Seattle, Washington**
as the local reporting context.

## Preservation policy

Generated images and their archive entries are append-only. A later run may add
metadata, correct attribution, or add a revision, but it must never remove,
replace, overwrite, hide, or unpublish an existing image unless the user
specifically requests deletion.

Deletion always requires a separate confirmation step. After receiving a
deletion request, the task must first present an exact deletion manifest with
the repository, activity date, entry ID, asset path, format, and deployment
locations for every affected image. It must then ask the user to confirm those
specific targets in a subsequent message. Silence, an earlier general request,
or an ambiguous confirmation is not authorization to delete anything.

## GitHub Pages

The deployment workflow publishes the static site from the `main` branch using
GitHub Actions.

Expected URL after Pages is enabled:

<https://tvw96.github.io/daily-commit-canvas/>
