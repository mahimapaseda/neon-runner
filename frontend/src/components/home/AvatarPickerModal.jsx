import React from 'react';

const AvatarPickerModal = ({ isOpen, user, tempAvatar, setTempAvatar, onConfirm, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="home-modal-backdrop">
            <div className="glass-panel home-avatar-modal">
                <div className="panel-corner corner-tl"></div>
                <div className="panel-corner corner-br"></div>
                <h2 className="home-modal-title">// IDENTITY_CUSTOMIZATION</h2>

                <div className="home-avatar-grid">
                    {['set1', 'set2', 'set3', 'set4'].map((set, idx) => {
                        const encodedUsername = encodeURIComponent(user.username);
                        const avatarOptionUrl = `https://robohash.org/${encodedUsername}?set=${set}`;
                        const isSelected = tempAvatar?.includes(set);

                        return (
                            <div
                                key={set}
                                onClick={() => setTempAvatar(avatarOptionUrl)}
                                className={`avatar-option${isSelected ? ' is-selected' : ''}`}
                            >
                                <img src={avatarOptionUrl} alt={set} className="avatar-option-image" />
                                <div className="avatar-option-label">STYLE_0{idx + 1}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="home-modal-actions">
                    <button className="btn-primary home-modal-btn" onClick={onConfirm}>CONFIRM_IDENTITY</button>
                    <button className="btn-secondary home-modal-btn" onClick={onClose}>ABORT</button>
                </div>
            </div>
        </div>
    );
};

export default AvatarPickerModal;
