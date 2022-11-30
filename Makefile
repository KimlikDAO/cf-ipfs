build/cf-ipfs.js: cf-ipfs.js cf-ipfs-env.js \
                  lib/cloudflare/types.js lib/cloudflare/serviceWorker.js \
                  lib/util/çevir.js \
                  lib/ipfs.js
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
