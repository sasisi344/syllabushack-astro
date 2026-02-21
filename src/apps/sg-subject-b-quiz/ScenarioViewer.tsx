/** @jsxImportSource preact */

interface ScenarioViewerProps {
  text: string;
}

export default function ScenarioViewer({ text }: ScenarioViewerProps) {
  return (
    <div class="sg-scenario-viewer">
      <div class="sg-scenario-header">
        <span class="sg-scenario-tag">シナリオ文</span>
      </div>
      <div class="sg-scenario-content">
        {text.split('\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
