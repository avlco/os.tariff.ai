@@ -1,3 +1,28 @@
export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}
