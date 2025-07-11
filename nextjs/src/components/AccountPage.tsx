/**
 * アカウントページコンポーネント
 * 
 * @description 旧システムのopen/account/account.jspを移植
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CommonKnowledgeList } from './partials/CommonKnowledgeList';
import { CPChart } from './partials/CPChart';
import { AccountInfo, ContributionPointHistory, ActivityHistory } from '@/types/account';
import { StockKnowledge } from '@/types/knowledge';
import { useLocale } from '@/lib/hooks/useLocale';

interface AccountPageProps {
  userId: number;
  offset?: number;
}

export const AccountPage: React.FC<AccountPageProps> = ({ userId, offset = 0 }) => {
  const { t } = useLocale();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [knowledges, setKnowledges] = useState<StockKnowledge[]>([]);
  const [cpData, setCpData] = useState<ContributionPointHistory[]>([]);
  const [activities, setActivities] = useState<ActivityHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'knowledge' | 'activity'>('knowledge');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // アカウント情報とナレッジ一覧を取得
  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const response = await fetch(`/api/open/account/info/${userId}?offset=${offset}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('ユーザーが見つかりません');
          } else {
            throw new Error('Failed to fetch account info');
          }
          return;
        }
        const data = await response.json();
        setAccountInfo({
          userId: data.userId,
          userName: data.userName,
          knowledgeCount: data.knowledgeCount,
          likeCount: data.likeCount,
          stockCount: data.stockCount,
          point: data.point,
        });
        setKnowledges(data.knowledges || []);
      } catch (err) {
        console.error('Error fetching account info:', err);
        setError('エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, [userId, offset]);

  // CP（Contribution Point）データを取得
  useEffect(() => {
    const fetchCPData = async () => {
      try {
        const response = await fetch(`/api/open/account/cp/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setCpData(data);
        }
      } catch (err) {
        console.error('Error fetching CP data:', err);
      }
    };

    if (userId) {
      fetchCPData();
    }
  }, [userId]);

  // アクティビティを取得（タブ切り替え時）
  useEffect(() => {
    const fetchActivities = async () => {
      if (activeTab !== 'activity') return;
      
      try {
        const response = await fetch(`/api/open/account/activity/${userId}?offset=0`);
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
    };

    fetchActivities();
  }, [userId, activeTab]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!accountInfo) {
    return <div>No account info</div>;
  }

  return (
    <div data-testid="account-page">
      <input type="hidden" id="userId" value={userId} />
      <input type="hidden" id="point" value={accountInfo.point || 0} />
      
      <div className="row">
        <div className="col-sm-6 col-md-6">
          <h4 className="title">
            <Image
              id="icon"
              src={`/api/open/account/icon/${userId}`}
              width={64}
              height={64}
              alt="icon"
            />
            &nbsp;
            {accountInfo.userName}
          </h4>
          
          <div className="row">
            <div className="col-xs-6">
              <i className="fa fa-heart-o"></i>&nbsp;{t('knowledge.account.label.cp')}
            </div>
            <div className="col-xs-6">
              <i className="fa fa-times"></i>&nbsp;{accountInfo.point || 0}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <i className="fa fa-book"></i>&nbsp;{t('knowledge.account.label.knowledge.count')}
            </div>
            <div className="col-xs-6">
              <i className="fa fa-times"></i>&nbsp;{accountInfo.knowledgeCount}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <i className="fa fa-thumbs-o-up"></i>&nbsp;{t('knowledge.account.label.like.count')}
            </div>
            <div className="col-xs-6">
              <i className="fa fa-times"></i>&nbsp;{accountInfo.likeCount}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <i className="fa fa-star-o"></i>&nbsp;{t('knowledge.account.label.stock.count')}
            </div>
            <div className="col-xs-6">
              <i className="fa fa-times"></i>&nbsp;{accountInfo.stockCount}
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-md-6">
          <div data-testid="cp-chart">
            <CPChart data={cpData} />
          </div>
        </div>
      </div>

      <div className="row" id="tabArea">
        <ul className="nav nav-tabs">
          <li 
            role="presentation" 
            className={activeTab === 'knowledge' ? 'active' : ''} 
            id="tabKnowledge"
          >
            <a 
              role="tab"
              onClick={() => setActiveTab('knowledge')}
              style={{ cursor: 'pointer' }}
            >
              {t('knowledge.account.label.knowledges')}
            </a>
          </li>
          <li 
            role="presentation" 
            className={activeTab === 'activity' ? 'active' : ''} 
            id="tabActivity"
          >
            <a 
              role="tab"
              onClick={() => setActiveTab('activity')}
              style={{ cursor: 'pointer' }}
            >
              {t('knowledge.account.label.activity')}
            </a>
          </li>
        </ul>
      </div>

      <div 
        id="knowledgesArea" 
        data-testid="knowledges-area"
        style={{ display: activeTab === 'knowledge' ? 'block' : 'none' }}
      >
        <div className="sub_title"></div>
        {/* リスト */}
        <div className="row" id="knowledgeList">
          <CommonKnowledgeList knowledges={knowledges} />
        </div>
        {/* Pager */}
        <nav>
          <ul className="pager">
            <li className="previous">
              <Link href={`/open/account/info/${userId}?offset=${Math.max(0, offset - 1)}`}>
                <span aria-hidden="true">&larr;</span>{t('label.previous')}
              </Link>
            </li>
            <li className="next">
              <Link href={`/open/account/info/${userId}?offset=${offset + 1}`}>
                {t('label.next')} <span aria-hidden="true">&rarr;</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div 
        id="activityArea" 
        data-testid="activity-area"
        style={{ display: activeTab === 'activity' ? 'block' : 'none' }}
      >
        <br /><br />
        <div className="list-group" id="activityList">
          {activities.map((activity, index) => (
            <a key={index} className="list-group-item">
              <h4 
                className="list-group-item-heading" 
                dangerouslySetInnerHTML={{ __html: activity.msg }}
              />
              <p className="list-group-item-text">{activity.dispDate}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};