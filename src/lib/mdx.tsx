import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import { mdxComponents } from "@/components/mdx-components";

export async function renderMdx(source: string) {
  const result = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [[rehypePrism, { showLineNumbers: true, ignoreMissing: true }]],
      },
    },
  });

  return result.content;
}
