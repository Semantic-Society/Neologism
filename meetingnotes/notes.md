22.05.2018
==========

- User permissions, global user roles.
- for vocabs: list of users, that have edit access.
- vocab can be published. This will create a copy of the current vocab and release it as version. (Will be used as versioning)


Current stand on identifiers for vocabularies:

classes:

https://datalab.rwth-aachen.de/neologism/v/prefix/Vn/Classname

* Must be resolvable!

https://datalab.rwth-aachen.de/neologism/v/prefix/Vn

* Must then open the vocabulary page itself
    * content negotiation could also make it serve the rdfs version or even shex?


https://datalab.rwth-aachen.de/neologism/v/prefix/

* redirects to the next one:

https://datalab.rwth-aachen.de/neologism/v/prefix/latest/

* serves the latest known verison of the vocab
