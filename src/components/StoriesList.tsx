import React from 'react';

type Props = {
  userId: string;
};

const StoriesList = ({ userId }: Props) => {
  return (
    <section className="stories-list">
      <p>📚 Liste des récits partagés par les utilisateurs (userId: {userId})</p>
      {/* TODO: Remplacer par tes vrais composants StoryCard */}
    </section>
  );
};

export default StoriesList;