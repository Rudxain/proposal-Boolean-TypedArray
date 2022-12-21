# BooleanArray

## Motivation

> to-do

## Pros & Cons

> to-do

## Limitations

> to-do

## Optimization

Engines are allowed to compress the bitset, the actual encoding/compression-algorithm is implementation-defined.

All implementations **must** encode each bool in 1bit or less. That is, allocating 1Byte for each bool is explicitly forbidden, because that would make `BYTES_PER_ELEMENT` misleading
