/**
 * 
 */
package com.googlecode.diskaro.library;

import java.io.File;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * @author S4T4N
 *
 */
public class Track extends DataCore {
	protected File path;
	protected Artist artist = null;		//Primary/main artist
	protected Release release = null;
	protected Integer trackNumber = null;
	
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
