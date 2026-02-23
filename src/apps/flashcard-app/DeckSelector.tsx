/** @jsxImportSource preact */

interface Deck {
  id: string;
  name: string;
  count: number;
}

export default function DeckSelector({ onSelect }: { onSelect: (id: string) => void }) {
  const decks: Deck[] = [
    { id: 'genai-ethics', name: '生成AI・AI倫理', count: 20 },
    { id: 'ip', name: 'ITパスポート用語', count: 100 },
    { id: 'fe', name: '基本情報用語', count: 50 },
    { id: 'ap', name: '応用情報用語', count: 80 },
  ];

  return (
    <div class="deck-selector">
      <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>暗記デッキを選択</h2>
      <div style={{display: 'grid', gap: '1rem'}}>
        {decks.map(deck => (
          <button 
            class="control-btn" 
            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', justifyContent: 'space-between', padding: '1.2rem'}}
            onClick={() => onSelect(deck.id)}
          >
            <span style={{fontWeight: 'bold'}}>{deck.name}</span>
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{deck.count} cards</span>
          </button>
        ))}
      </div>
    </div>
  );
}
