# npm packages for Tailor Platform Function service

## Development Workflow

This repository uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

### Creating a Changeset

Run the following command at the root of the repository:

```bash
pnpm changeset
```

We recommend creating a changeset for every PR that includes functional changes.

### Release Process

1. When a PR with changesets is merged, a "Version Packages" PR is automatically created or updated
2. This PR shows the final CHANGELOG updates and the versions that will be published for each package
3. Merging the "Version Packages" PR automatically publishes the packages to npm

For more details, see the [Changesets documentation](https://github.com/changesets/changesets) and [Changesets GitHub Action](https://github.com/changesets/action).
