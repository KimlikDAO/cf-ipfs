build/cf-ipfs.js: cf-ipfs.js cf-ipfs-env.js \
                  lib/ipfs.js lib/util/çevir.js lib/util/cfServiceWorker.js
	mkdir -p build
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -o $@

clean:
	rm -rf build

cf-deployment: build/cf-ipfs.js
	yarn wrangler publish
