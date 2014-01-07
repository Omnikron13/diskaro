/**
 * 
 */
package com.googlecode.diskaro.library;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * @author S4T4N
 *
 */
public class Release extends DataCore {
	protected Integer year = null;
	protected Label label = null;
	
	public Label getLabel() {
		return label;
	}
	
	/**
	 * Returns the name of the primary table used to store releases.
	 * This is primarily so methods such as DataCore.get() can be used.
	 * @return primary table name - "releases"
	 */
	public static String table() {
		return "releases";
	}
	public String getTable() {
		return table();
	}
	
	public Release(int id) throws SQLException {
		ResultSet rs = getByID(id);
		int year = rs.getInt("year");
		if(!rs.wasNull()) {
			this.year = year;
		}
		int labelID = rs.getInt("labelID");
		if(!rs.wasNull()) {
			this.label = new Label(labelID);
		}
	}
	
	protected static PreparedStatement addStatement = null;
	protected static PreparedStatement addStatement() throws SQLException {
		if(addStatement == null) {
			addStatement = Library.getDB().prepareStatement("INSERT INTO releases (name, year, labelID) VALUES (?, ?, ?);",
					Statement.RETURN_GENERATED_KEYS);
		}
		return addStatement;
	}
	
	public static Release add(String name, Integer year, Label label) throws SQLException {
		PreparedStatement ps = addStatement();
		ps.setString(1, name);
		if(year != null) {
			ps.setInt(2, year);
		}
		if(label != null) {
			ps.setInt(3, label.getID());
		}
		ps.executeUpdate();
		return new Release(ps.getGeneratedKeys().getInt(1));
	}
}
