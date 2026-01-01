import os

root_dir = os.path.abspath(os.path.join(os.getcwd(), "../motion-canvas-3.17.0"))
output_file = "code_index.md"

def generate_index():
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("# Motion Canvas Code Index\n\n")
        f.write("此文件包含核心组件和逻辑的文件路径索引，用于辅助 Agent 查找源码。\n\n")
        
        # 1. 2D Components (最重要)
        components_dir = os.path.join(root_dir, "2d", "src", "lib", "components")
        if os.path.exists(components_dir):
            f.write("## 2D Components (图形组件)\n")
            f.write("路径: `packages/2d/src/lib/components`\n\n")
            for file in sorted(os.listdir(components_dir)):
                if file.endswith(".ts") and not file.endswith("test.ts") and file != "index.ts":
                    name = file.replace(".ts", "")
                    rel_path = f"motion-canvas-3.17.0/2d/src/lib/components/{file}"
                    f.write(f"- **{name}**: [`{rel_path}`]({rel_path})\n")
            f.write("\n")

        # 2. Core Signals (响应式系统)
        signals_dir = os.path.join(root_dir, "core", "src", "signals")
        if os.path.exists(signals_dir):
            f.write("## Signals (响应式信号)\n")
            f.write("路径: `packages/core/src/signals`\n\n")
            for file in sorted(os.listdir(signals_dir)):
                if file.endswith(".ts") and not file.endswith("test.ts") and file != "index.ts":
                    name = file.replace(".ts", "")
                    rel_path = f"motion-canvas-3.17.0/core/src/signals/{file}"
                    f.write(f"- **{name}**: [`{rel_path}`]({rel_path})\n")
            f.write("\n")

        # 3. Flow Control (流程控制)
        flow_dir = os.path.join(root_dir, "core", "src", "flow")
        if os.path.exists(flow_dir):
            f.write("## Flow Control (流程控制)\n")
            f.write("路径: `packages/core/src/flow`\n\n")
            for file in sorted(os.listdir(flow_dir)):
                 if file.endswith(".ts") and not file.endswith("test.ts") and file != "index.ts":
                    name = file.replace(".ts", "")
                    rel_path = f"motion-canvas-3.17.0/core/src/flow/{file}"
                    f.write(f"- **{name}**: [`{rel_path}`]({rel_path})\n")
            f.write("\n")
            
        # 4. Tweening (补间动画)
        tween_dir = os.path.join(root_dir, "core", "src", "tweening")
        if os.path.exists(tween_dir):
            f.write("## Tweening (补间动画)\n")
            f.write("路径: `packages/core/src/tweening`\n\n")
            for file in sorted(os.listdir(tween_dir)):
                 if file.endswith(".ts") and not file.endswith("test.ts") and file != "index.ts":
                    name = file.replace(".ts", "")
                    rel_path = f"motion-canvas-3.17.0/core/src/tweening/{file}"
                    f.write(f"- **{name}**: [`{rel_path}`]({rel_path})\n")
            f.write("\n")

    print(f"Index generated at {os.path.abspath(output_file)}")

if __name__ == "__main__":
    generate_index()
