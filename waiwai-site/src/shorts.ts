function split_path(whole_path: string, sep: string, maxsplit: number): string[] {
    let splitted_path: string[] = [];
    for (let i = 0; i < maxsplit; i++) {
        if (!whole_path) { break; }
        splitted_path.push(whole_path.split(sep)[0]);
        whole_path = whole_path.slice(whole_path.split(sep)[0].length + 1);
    }
    if (whole_path) splitted_path.push(whole_path);
    return splitted_path;
}

function get_item(array: any[], index: number) {
    if (index < 0) {
        return array[array.length + index];
    }
    if (index < array.length) {
        return array[index];
    }
}

interface Env {
	MY_KV_NAMESPACE: KVNamespace;
}

export default {
    async handleShorts(request: Request, env: Env): Promise<any> {
        if (request.method === "GET") {
            const url = new URL(request.url);

            if (url.pathname.startsWith("/shorts/set", 0)) {
                const splitted_path = split_path(url.pathname, "/", 4);
                if (get_item(splitted_path, -1) && get_item(splitted_path, -2)) {
                    await env.MY_KV_NAMESPACE.put(get_item(splitted_path, -2), get_item(splitted_path, -1));

                    let content: { [key: string]: string | null }  = {};
                    for (const key of (await env.MY_KV_NAMESPACE.list()).keys) {
                        content[key.name] = await env.MY_KV_NAMESPACE.get(key.name) || null;
                    }

                    return Response.json({
                        "status": 200,
                        "msg": "Shorten url added successfully",
                        "content": content
                    })
                }
            }

            if (url.pathname.startsWith("/shorts/remove", 0)) {
                const splitted_path = split_path(url.pathname, "/", 3);
                if (get_item(splitted_path, -1) && await env.MY_KV_NAMESPACE.get(get_item(splitted_path, -1))) {
                    await env.MY_KV_NAMESPACE.delete(get_item(splitted_path, -1));

                    let content: { [key: string]: string | null }  = {};
                    for (const key of (await env.MY_KV_NAMESPACE.list()).keys) {
                        content[key.name] = await env.MY_KV_NAMESPACE.get(key.name) || null;
                    }

                    return Response.json({
                        "status": 200,
                        "msg": "Shorten url removed successfully",
                        "content": content
                    })
                }
            }

            if (url.pathname.startsWith("/shorts", 0)) {
                const splitted_path = split_path(url.pathname, "/", 2);
                if (get_item(splitted_path, -1)) {
                    if (await env.MY_KV_NAMESPACE.get(get_item(splitted_path, -1))) {
                        let url = String(await env.MY_KV_NAMESPACE.get(get_item(splitted_path, -1)));
                        return Response.redirect(url);
                    }
                }
            }
        }
    }
}