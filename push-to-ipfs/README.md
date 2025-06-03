# Push to IPFS action

This action performs a pin to Aleph IPFS

## Inputs

## `upload-dir`

**Required** Directory to upload

## Outputs

## `cid`

Generated IPFS CID

## Example usage

```yaml
- name: Push to IPFS
  uses: aleph-im/aleph-github-actions/push-to-ipfs@v1
  with:
    upload-dir: out
```
