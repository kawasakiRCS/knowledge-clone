/**
 * ナレッジ一覧の共通コンポーネント（スタブ）
 * 
 * @description 旧システムのopen/knowledge/partials/common_list.jspを移植予定
 * TODO: 別Issueで実装
 */
import React from 'react';
import { StockKnowledge } from '@/types/knowledge';

interface CommonKnowledgeListProps {
  knowledges: StockKnowledge[];
}

export const CommonKnowledgeList: React.FC<CommonKnowledgeListProps> = ({ knowledges }) => {
  return (
    <div className="knowledge-list">
      {knowledges.map((knowledge) => (
        <div key={knowledge.knowledgeId} className="knowledge-item">
          <h4>{knowledge.title}</h4>
          {/* TODO: 実装は別Issueで行う */}
        </div>
      ))}
    </div>
  );
};