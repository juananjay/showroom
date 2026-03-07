import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Container, Modal, ModalBody } from 'reactstrap';
import { SHOWROOM_COMPETITION } from 'utils/api/api';
import { Loading } from 'components';
import MainLayout from 'pages/layout/MainLayout';
import { FaCrown, FaMedal, FaTrophy, FaTimes } from 'react-icons/fa';
import { IoMdPeople } from 'react-icons/io';
import formatName from 'utils/formatName';
import moment from 'moment';
import './competition.scss';

const Competition = (props) => {
  const [loading, setLoading] = useState(false);
  const [rankings, setRankings] = useState([]);
  const [competition, setCompetition] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchCompetition = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(SHOWROOM_COMPETITION);
      setRankings(data?.rankings || []);
      setCompetition(data);
    } catch (error) {
      console.error('Error fetching competition data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompetition();
  }, [fetchCompetition]);

  const formatNumber = (num) => {
    return num?.toLocaleString('id-ID') || '0';
  };

  const formatDuration = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const getTimeSince = (dateStr) => {
    if (!dateStr) return '';
    const now = moment();
    const liveDate = moment(dateStr);
    const diffHours = now.diff(liveDate, 'hours');
    const diffDays = now.diff(liveDate, 'days');

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'rank-badge gold';
    if (rank === 2) return 'rank-badge silver';
    if (rank === 3) return 'rank-badge bronze';
    return 'rank-badge default';
  };

  const getTrendIcon = (rankDiff) => {
    if (rankDiff > 0) return { icon: '▲', className: 'trend-up' };
    if (rankDiff < 0) return { icon: '▼', className: 'trend-down' };
    return { icon: '—', className: 'trend-neutral' };
  };

  const openDetail = (item) => {
    setSelectedMember(item);
  };

  const closeDetail = () => {
    setSelectedMember(null);
  };

  const DetailGrid = ({ live, trend }) => (
    <div className="details-grid">
      <div className="detail-item">
        <span className="detail-label">Live Count</span>
        <span className="detail-value">{live.live_count}x</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Active Days</span>
        <span className="detail-value">{live.active_days}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Total Gift</span>
        <span className="detail-value">{formatNumber(live.total_gift)}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Comments</span>
        <span className="detail-value">
          {formatNumber(live.total_comments)}
        </span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Avg Duration</span>
        <span className="detail-value">
          {formatDuration(live.avg_duration)}
        </span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Avg Gift/Live</span>
        <span className="detail-value">
          {formatNumber(live.avg_gift_per_live)}
        </span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Peak Viewers</span>
        <span className="detail-value">
          {formatNumber(live.max_viewer_peak)}
        </span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Pts/Live</span>
        <span className="detail-value">
          {formatNumber(live.point_per_live)}
        </span>
      </div>
      {trend?.point_diff !== undefined && (
        <div className="detail-item highlight">
          <span className="detail-label">Point Diff</span>
          <span className="detail-value trend-up">
            +{formatNumber(trend.point_diff)}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <MainLayout title="Competition | JKT48 SHOWROOM" {...props}>
      <Container isFluid>
        <div className="competition-page">
          <div className="competition-header">
            <div className="header-left">
              <FaTrophy className="header-trophy" />
              <h3 className="header-title">
                JKT48 × SHOWROOM Japan TV Competition
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="ranking-card skeleton-card">
                  <div className="skeleton-content">
                    <Loading size="30" />
                  </div>
                </div>
              ))}
            </div>
          ) : rankings.length > 0 ? (
            <>
              {/* Top 3 Podium */}
              {rankings.length >= 3 && (
                <div className="podium-section">
                  {[rankings[1], rankings[0], rankings[2]].map((item, idx) => {
                    const podiumClass =
                      idx === 1 ? 'first' : idx === 0 ? 'second' : 'third';
                    const podiumLabel =
                      idx === 1 ? '1st' : idx === 0 ? '2nd' : '3rd';
                    const trend = getTrendIcon(item?.trend?.rank_diff);

                    return (
                      <div
                        key={item.rank}
                        className={`podium-card ${podiumClass}`}
                        onClick={() => openDetail(item)}
                      >
                        <div className="podium-rank-label">
                          <FaTrophy
                            className={`podium-trophy ${podiumClass}`}
                          />
                          {podiumLabel}
                        </div>
                        <div className="podium-avatar-wrapper">
                          <img
                            src={item.room?.image_square}
                            alt={item.room?.nickname}
                            className="podium-avatar"
                          />
                        </div>
                        <h4 className="competition-member-name">
                          {item.room?.nickname || formatName(item.room?.name)}
                        </h4>
                        <div className="podium-points">
                          <span>{formatNumber(item.point)}</span>
                        </div>
                        <span className="podium-points-label">
                          Total points
                        </span>
                        <div className="podium-stats">
                          {item.trend?.rank_diff !== undefined && (
                            <span className={`stat-badge ${trend.className}`}>
                              {trend.icon} {Math.abs(item.trend.rank_diff)}
                            </span>
                          )}
                          {item.live && (
                            <span className="stat-badge live-count">
                              {item.live.live_count}x Live
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Remaining Rankings */}
              <div className="rankings-list">
                {rankings
                  .filter((item) => item.rank > 3)
                  .map((item) => {
                    const trend = getTrendIcon(item?.trend?.rank_diff);

                    return (
                      <div
                        key={item.rank}
                        className="ranking-card"
                        onClick={() => openDetail(item)}
                      >
                        <div className="card-main">
                          <div className="card-left">
                            <div className={getRankBadgeClass(item.rank)}>
                              <span className="rank-number">{item.rank}</span>
                            </div>

                            <div className="member-avatar">
                              <img
                                src={item.room?.image_square}
                                alt={item.room?.nickname}
                                className="avatar-img"
                              />
                            </div>

                            <div className="member-info">
                              <h4 className="member-name">
                                {item.room?.nickname ||
                                  formatName(item.room?.name)}
                              </h4>
                              {item.live?.last_live_at && (
                                <span className="last-live text-white">
                                  Last live:{' '}
                                  {getTimeSince(item.live.last_live_at)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="card-right">
                            <div className="points-section">
                              <span className="points-value">
                                {formatNumber(item.point)}
                              </span>
                              <span className="points-label">Total points</span>
                            </div>
                          </div>
                        </div>

                        <div className="card-stats">
                          <div className="stats-badges">
                            {item.gap_above !== null && (
                              <span className="stat-badge gap-above">
                                ▲ {formatNumber(item.gap_above)}
                              </span>
                            )}
                            {item.gap_above === null && (
                              <span className="stat-badge gap-above no-gap">
                                ▲ —
                              </span>
                            )}
                            {item.gap_below !== null && (
                              <span className="stat-badge gap-below text-green">
                                ▼ {formatNumber(item.gap_below)}
                              </span>
                            )}
                            {item.trend?.rank_diff !== undefined && (
                              <span className={`stat-badge ${trend.className}`}>
                                {trend.icon} {Math.abs(item.trend.rank_diff)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <FaTrophy className="empty-icon" />
              <p>No competition data available</p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <Modal
          isOpen={!!selectedMember}
          toggle={closeDetail}
          centered
          className="competition-detail-modal"
        >
          {selectedMember && (
            <ModalBody className="competition-modal-body">
              <button className="modal-close-btn" onClick={closeDetail}>
                <FaTimes />
              </button>
              <div className="modal-header-section">
                <img
                  src={selectedMember.room?.image_square}
                  alt={selectedMember.room?.nickname}
                  className="modal-avatar"
                />
                <div className="modal-member-info">
                  <h4>
                    {selectedMember.room?.nickname ||
                      formatName(selectedMember.room?.name)}
                  </h4>
                  <span className="modal-rank">
                    Rank #{selectedMember.rank}
                  </span>
                  <div className="modal-points">
                    <FaTrophy className="modal-trophy" />
                    <span>{formatNumber(selectedMember.point)} pts</span>
                  </div>
                </div>
              </div>
              {selectedMember.live && (
                <DetailGrid
                  live={selectedMember.live}
                  trend={selectedMember.trend}
                />
              )}
            </ModalBody>
          )}
        </Modal>
      </Container>
    </MainLayout>
  );
};

export default Competition;
