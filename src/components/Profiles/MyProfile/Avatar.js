/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Avatar = ({
  editPhoto, handleSubmitPhoto, profil_image, editFormToggle, isEditing,
}) => {
  const [avatar, setAvatar] = useState();
  const [errorAvatar, setErrorAvatar] = useState('');
  useEffect(() => {
    if (avatar) {
      const allowedExtension = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
      if (!allowedExtension.exec(avatar.name)) {
        return setErrorAvatar('Le fichier que vous avez séléctionné n\'a pas le format autorisé. Veuillez choisir un fichier image au format *.jpeg / *.png / *.jpg');
      }
      if (avatar.size > 2000000) return setErrorAvatar('Le fichier que vous séléctionné est trop volumineux. Veuillez choisir un fichier de taille 2mo maximum');
      return setErrorAvatar('');
    }
    return null;
  }, [avatar]);
  return (
    <>
      {isEditing && editPhoto ? (
        <form
          className="myprofile__user--picture-form"
          type="submit"
          onSubmit={(e) => handleSubmitPhoto(e, avatar)}
        >

          <div className="myprofile__user--picture-desc">
            <p className="myprofile__user--picture-title">Image de profil</p>
            <label htmlFor="avatar" className="signup-submit__group--avatar__container edit-profile__avatar-container">
              <span className="signup-submit__group--avatar__container__label">Choisir une photo</span>
              <input
                name="avatar"
                id="avatar"
                type="file"
                placeholder="Choisir une photo"
                className="signup-submit__group__input--avatar"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
            </label>
            <div className="signup-submit__container-shown-avatar">
              {avatar && <img className="signup-submit__show-avatar" src={URL.createObjectURL(avatar)} alt={`Votre fichier séléctionné est ${avatar.name}`} />}
            </div>
            {errorAvatar && <p className="signup-submit__error">{errorAvatar}</p>}
            <div className="myprofile__user--submit-container">
              <button className="myprofile__user--edit-submit-btn" type="submit" disabled={errorAvatar}>Envoyer</button>

              <button
                type="button"
                className="myprofile__user--close-edit-btn"
                onClick={() => editFormToggle('editPhoto')}
              >
                <i className="fas fa-times-circle" />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="myprofile__user--avatar">
          {!profil_image && <img className="friends-list__member--picture" src={`${process.env.BANDIFY_API_URL}/avatar/avatar.png`} alt="avatar du membre" />}
          {profil_image && <img className="myprofile__user--picture" src={`${process.env.BANDIFY_API_URL}/avatar/${profil_image}`} alt="avatar du membre" />}
          {
            isEditing && (
              <>
                {!profil_image && <p className="myprofile__user--name">Ajouter une photo de profil </p>}
                <button
                  type="button"
                  onClick={() => editFormToggle('editPhoto')}
                  className="myprofile__user--edit-photo"
                >
                  <i className="fas fa-pen" />
                </button>
              </>
            )
          }
        </div>
      )}
    </>
  );
};

Avatar.propTypes = {
  profil_image: PropTypes.string,
  editFormToggle: PropTypes.func.isRequired,
  editPhoto: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  handleSubmitPhoto: PropTypes.func.isRequired,
};
Avatar.defaultProps = {
  profil_image: '',
};

export default Avatar;
