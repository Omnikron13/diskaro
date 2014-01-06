/**
 * 
 */
package com.googlecode.diskaro.library;

import java.io.File;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

/**
 * @author S4T4N
 *
 */
public class Track extends DataCore {
	//Basic information about a track
	protected File path;
	protected Artist artist = null;		//Primary/main artist
	protected Release release = null;
	protected Integer trackNumber = null;
	
	//--Stored SQL statements, created JIT--
	//Statement for adding records to trackGenres
	protected PreparedStatement addGenreStatement = null;
	protected PreparedStatement addGenreStatement() throws SQLException {
		if(addGenreStatement == null) {
			addGenreStatement = Library.getDB().prepareStatement("INSERT INTO trackGenres (trackID, genreID) VALUES (?, ?);");
			addGenreStatement.setInt(1, id);
		}
		return addGenreStatement;
	}
	//Statement for pulling records from trackGenres
	protected PreparedStatement getGenresStatement = null;
	protected PreparedStatement getGenresStatement() throws SQLException {
		if(getGenresStatement == null) {
			getGenresStatement = Library.getDB().prepareStatement("SELECT genreID FROM trackGenres WHERE trackID = ? ORDER BY id;");
			getGenresStatement.setInt(1, id);
		}
		return getGenresStatement;
	}
	//Statement to remove a genre from trackGenres
	protected PreparedStatement removeGenreStatement = null;
	protected PreparedStatement removeGenreStatement() throws SQLException {
		if(removeGenreStatement == null) {
			removeGenreStatement = Library.getDB().prepareStatement("DELETE FROM trackGenres WHERE trackID = ? AND genreID = ?;");
			removeGenreStatement.setInt(1, id);
		}
		return removeGenreStatement;
	}
	//Statement for adding records to trackTags
	protected PreparedStatement addTagStatement = null;
	protected PreparedStatement addTagStatement() throws SQLException {
		if(addTagStatement == null) {
			addTagStatement = Library.getDB().prepareStatement("INSERT INTO trackTags (trackID, tagID) VALUES (?, ?);");
			addTagStatement.setInt(1, id);
		}
		return addTagStatement;
	}
	//Statement for pulling records from trackTags
	protected PreparedStatement getTagsStatement = null;
	protected PreparedStatement getTagsStatement() throws SQLException {
		if(getTagsStatement == null) {
			getTagsStatement = Library.getDB().prepareStatement("SELECT tagID FROM trackTags WHERE trackID = ? ORDER BY id;");
			getTagsStatement.setInt(1, id);
		}
		return getTagsStatement;
	}
	//Statement to remove a tag from trackTags
	protected PreparedStatement removeTagStatement = null;
	protected PreparedStatement removeTagStatement() throws SQLException {
		if(removeTagStatement == null) {
			removeTagStatement = Library.getDB().prepareStatement("DELETE FROM trackTags WHERE trackID = ? AND tagID = ?;");
			removeTagStatement.setInt(1, id);
		}
		return removeTagStatement;
	}
	
	/**
	 * Returns the path to the track's audio file as a File object.
	 * @return the path.
	 */
	public File getPath() {
		return path;
	}
	
	/**
	 * Returns the main artist the track is credited to as an Artist object.
	 * Note that this may be null if the track hasn't been labelled (yet).
	 * @return the Artist object or null
	 */
	public Artist getArtist() {
		return artist;
	}
	
	/**
	 * Returns the release (album, single, EP etc.) that the track appears on
	 * as a Release object. Note that this may be null if the track hasn't, or
	 * cannot, be labelled (yet).
	 * @return the Release object or null
	 */
	public Release getRelease() {
		return release;
	}
	
	/**
	 * Returns the track number that the track appeared at on its release for
	 * correct ordering. Note that this may be null if the track hasn't, or
	 * cannot, be labelled (yet).
	 * @return the track number as an Integer object, or null
	 */
	public Integer getTrackNumber() {
		return trackNumber;
	}

	/* (non-Javadoc)
	 * @see com.googlecode.diskaro.library.DataCore#getTable()
	 */
	@Override
	protected String getTable() {
		return "tracks";
	}

	/**
	 * Load a track from the database by its UID.
	 * @param id the UID of the track to be loaded
	 * @throws SQLException
	 */
	public Track(int id) throws SQLException {
		ResultSet rs = getByID(id);
		path = new File(rs.getString("path"));
		int artistID = rs.getInt("artistID");
		if(!rs.wasNull()) {
			artist = new Artist(artistID);
		}
		int releaseID = rs.getInt("releaseID");
		if(!rs.wasNull()) {
			release = new Release(releaseID);
		}
		int trackNumber = rs.getInt("trackNumber");
		if(!rs.wasNull()) {
			this.trackNumber = trackNumber;
		}
	}
	
	/**
	 * Label a track with a genre.
	 * @param genre valid Genre object
	 * @throws SQLException
	 */
	public void addGenre(Genre genre) throws SQLException {
		PreparedStatement ps = addGenreStatement();
		ps.setInt(2, genre.getID());
		ps.executeUpdate();
	}
	
	/**
	 * Removes a genre from the track in the trackGenres table.
	 * @param genre Genre object representing the genre to remove
	 * @throws SQLException
	 */
	public void removeGenre(Genre genre) throws SQLException {
		PreparedStatement ps = removeGenreStatement();
		ps.setInt(2, genre.getID());
		ps.executeUpdate();
	}
	
	/**
	 * Label a track with a generic tag.
	 * @param tag valid Tag object
	 * @throws SQLException
	 */
	public void addTag(Tag tag) throws SQLException {
		PreparedStatement ps = addTagStatement();
		ps.setInt(2, tag.getID());
		ps.executeUpdate();
	}
	
	/**
	 * Removes a generic tag from the track in the trackTags table.
	 * @param tag Tag object representing the tag to remove
	 * @throws SQLException
	 */
	public void removeTag(Tag tag) throws SQLException {
		PreparedStatement ps = removeTagStatement();
		ps.setInt(2, tag.getID());
		ps.executeUpdate();
	}
	
	/**
	 * Returns an ArrayList of Genre objects representing the genres that the track
	 * is labelled as being.
	 * @return ArrayList of Genre objects
	 * @throws SQLException
	 */
	public ArrayList<Genre> getGenres() throws SQLException {
		ArrayList<Genre> genres = new ArrayList<Genre>(5);
		ResultSet rs = getGenresStatement().executeQuery();
		while(rs.next()) {
			genres.add(new Genre(rs.getInt("genreID")));
		}
		return genres;
	}
	
	/**
	 * Returns an ArrayList of Tag objects representing the generic tags that the track
	 * is labelled with.
	 * @return ArrayList of Tag objects
	 * @throws SQLException
	 */
	public ArrayList<Tag> getTags() throws SQLException {
		ArrayList<Tag> tags = new ArrayList<Tag>(5);
		ResultSet rs = getTagsStatement().executeQuery();
		while(rs.next()) {
			tags.add(new Tag(rs.getInt("tagID")));
		}
		return tags;
	}
	
	//Stored SQL statement used to INSERT new track entries to the db, created JIT
	protected static PreparedStatement addStatement = null;
	protected static PreparedStatement addStatement() throws SQLException {
		if(addStatement == null) {
			addStatement = Library.getDB().prepareStatement("INSERT INTO tracks (name, path, artistID, releaseID, trackNumber) VALUES (?, ?, ?, ?, ?);",
					Statement.RETURN_GENERATED_KEYS);
		}
		return addStatement;
	}
	
	/**
	 * A a new track entry to the database.
	 * @param name			human name of the track (without remixer information etc.)
	 * @param path			file system path for the audio file as a File object
	 * @param artist		the main artist the track is credited to as an Artist object, or null
	 * @param release		the release the track appears on, or null
	 * @param trackNumber	the number the track appeared at on its release, or null
	 * @return	a new Track object that can be used to inspect or manipulate the track
	 * @throws SQLException
	 */
	public static Track add(String name, File path, Artist artist, Release release, Integer trackNumber) throws SQLException {
		PreparedStatement ps = addStatement();
		ps.setString(1, name);
		//check if supplied path exists here (also null checks, but that applies all over the place...)
		ps.setString(2, path.getPath());
		if(artist != null) {
			ps.setInt(3, artist.getID());
		}
		if(release != null) {
			ps.setInt(4, release.getID());
		}
		if(trackNumber != null) {
			ps.setInt(5, trackNumber);
		}
		ps.executeUpdate();
		return new Track(ps.getGeneratedKeys().getInt(1));
	}
}
