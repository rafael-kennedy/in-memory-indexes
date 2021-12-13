In Memory Indexes
===

This is a hypothetical examination into how to solve a problem of creating a responsive "in-memory index" in a node 
process to refer to a list of arbitrary points by their coordinates, such that we can relatively efficiently query
them by an arbitrary bounding box.

I am further assuming a few things:
- This is built for a distributed data mesh and may include data that the node would have to request, so strategies that would require querying the actual documents to refine the search will be unusable, or incur a significant penalty
- The index is in-memory, but needs to be efficiently serializable / deserializable so that it can be stored alongside the data itself in a data mesh. (This is not necessarily intended for a kappa-arch use-case)
- The full index is in-memory, and as such, it does not need to be "embedded" into a b-tree database itself. At present, we will abstract away the way that the index is actually shared. 